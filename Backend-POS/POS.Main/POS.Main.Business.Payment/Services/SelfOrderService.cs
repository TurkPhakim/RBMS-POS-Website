using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using POS.Main.Business.Admin.Services;
using POS.Main.Business.Notification.Interfaces;
using POS.Main.Business.Notification.Models;
using POS.Main.Business.Order.Interfaces;
using POS.Main.Business.Payment.Interfaces;
using POS.Main.Business.Payment.Models.Payment;
using POS.Main.Business.Payment.Models.SelfOrder;
using POS.Main.Core.Enums;
using POS.Main.Core.Exceptions;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Payment.Services;

public class SelfOrderService : ISelfOrderService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IOrderNotificationService _orderNotificationService;
    private readonly INotificationBroadcaster _notificationBroadcaster;
    private readonly IPaymentService _paymentService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SelfOrderService> _logger;

    private static readonly Dictionary<int, string> CategoryNames = new()
    {
        { (int)EMenuCategory.Food, "อาหาร" },
        { (int)EMenuCategory.Beverage, "เครื่องดื่ม" },
        { (int)EMenuCategory.Dessert, "ของหวาน" }
    };

    public SelfOrderService(
        IUnitOfWork unitOfWork,
        IJwtTokenService jwtTokenService,
        IOrderNotificationService orderNotificationService,
        INotificationBroadcaster notificationBroadcaster,
        IPaymentService paymentService,
        IConfiguration configuration,
        ILogger<SelfOrderService> logger)
    {
        _unitOfWork = unitOfWork;
        _jwtTokenService = jwtTokenService;
        _orderNotificationService = orderNotificationService;
        _notificationBroadcaster = notificationBroadcaster;
        _paymentService = paymentService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<CustomerAuthResponseModel> AuthenticateAsync(CustomerAuthRequestModel request, CancellationToken ct = default)
    {
        // Decode QR JWT to get tableId + nonce
        var (tableId, nonce) = DecodeQrToken(request.QrToken);

        var table = await _unitOfWork.Tables.QueryNoTracking()
            .Include(t => t.Zone)
            .FirstOrDefaultAsync(t => t.TableId == tableId && !t.DeleteFlag, ct)
            ?? throw new BusinessException("QR Code ไม่ถูกต้อง");

        // Validate nonce
        if (table.QrTokenNonce != nonce)
            throw new BusinessException("QR Code หมดอายุหรือถูกเปลี่ยนแล้ว กรุณาแจ้งพนักงาน");

        // Validate table status
        if (table.Status != ETableStatus.Occupied)
            throw new BusinessException("โต๊ะยังไม่ได้เปิดใช้งาน กรุณาแจ้งพนักงาน");

        // Check for existing active session from same device
        TbCustomerSession? session = null;
        if (!string.IsNullOrEmpty(request.DeviceFingerprint))
        {
            session = await _unitOfWork.CustomerSessions.GetActiveByTableAndDeviceAsync(
                tableId, request.DeviceFingerprint, ct);
        }

        if (session == null)
        {
            session = new TbCustomerSession
            {
                TableId = tableId,
                SessionToken = Guid.NewGuid().ToString("N"),
                DeviceFingerprint = request.DeviceFingerprint,
                QrTokenNonce = nonce,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(1)
            };

            await _unitOfWork.CustomerSessions.AddAsync(session, ct);
            await _unitOfWork.CommitAsync(ct);
        }

        var guestToken = _jwtTokenService.GenerateCustomerToken(session.CustomerSessionId, tableId);

        _logger.LogInformation("Customer session created/reused {SessionId} for Table {TableId}",
            session.CustomerSessionId, tableId);

        // Get shop branding
        var shopSettings = await _unitOfWork.ShopSettings.QueryNoTracking()
            .FirstOrDefaultAsync(ct);

        return new CustomerAuthResponseModel
        {
            SessionToken = guestToken,
            TableId = tableId,
            TableName = table.TableName,
            ZoneName = table.Zone.ZoneName,
            Nickname = session.Nickname,
            ShopNameThai = shopSettings?.ShopNameThai ?? string.Empty,
            ShopNameEnglish = shopSettings?.ShopNameEnglish,
            LogoFileId = shopSettings?.LogoFileId,
            Address = shopSettings?.Address,
            PhoneNumber = shopSettings?.PhoneNumber,
            ShopEmail = shopSettings?.ShopEmail,
            Facebook = shopSettings?.Facebook,
            Instagram = shopSettings?.Instagram,
            Website = shopSettings?.Website,
            PaymentQrCodeFileId = shopSettings?.PaymentQrCodeFileId,
            BankName = shopSettings?.BankName,
            AccountNumber = shopSettings?.AccountNumber,
            AccountName = shopSettings?.AccountName,
            WifiSsid = shopSettings?.WifiSsid,
            WifiPassword = shopSettings?.WifiPassword
        };
    }

    public async Task SetNicknameAsync(int sessionId, string nickname, CancellationToken ct = default)
    {
        var session = await _unitOfWork.CustomerSessions.GetByIdAsync(sessionId, ct)
            ?? throw new BusinessException("Session ไม่ถูกต้อง");

        session.Nickname = nickname.Trim();
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Customer {SessionId} set nickname to {Nickname}", sessionId, nickname);
    }

    public async Task<CustomerMenuCategoriesResponseModel> GetMenuCategoriesAsync(CancellationToken ct = default)
    {
        // Get sub-categories that have at least 1 available menu
        var subCategories = await _unitOfWork.MenuSubCategories.QueryNoTracking()
            .Where(sc => sc.IsActive && sc.Menus.Any(m => m.IsAvailable && !m.DeleteFlag))
            .OrderBy(sc => sc.CategoryType)
            .ThenBy(sc => sc.SortOrder)
            .Select(sc => new CustomerSubCategoryModel
            {
                SubCategoryId = sc.SubCategoryId,
                CategoryType = sc.CategoryType,
                Name = sc.Name
            })
            .ToListAsync(ct);

        // Build category list from sub-categories that exist
        var categoryTypes = subCategories.Select(sc => sc.CategoryType).Distinct().OrderBy(c => c);
        var categories = categoryTypes
            .Where(ct => CategoryNames.ContainsKey(ct))
            .Select(ct => new CustomerCategoryModel
            {
                CategoryType = ct,
                Name = CategoryNames[ct]
            })
            .ToList();

        return new CustomerMenuCategoriesResponseModel
        {
            Categories = categories,
            SubCategories = subCategories
        };
    }

    public async Task<List<CustomerMenuItemResponseModel>> GetMenuItemsAsync(
        int? categoryType, int? subCategoryId, string? search, CancellationToken ct = default)
    {
        var query = _unitOfWork.Menus.QueryNoTracking()
            .Include(m => m.SubCategory)
            .Include(m => m.SubCategory)
            .Include(m => m.MenuOptionGroups)
            .Where(m => m.IsAvailable);

        if (categoryType.HasValue)
            query = query.Where(m => m.SubCategory.CategoryType == categoryType.Value);

        if (subCategoryId.HasValue)
            query = query.Where(m => m.SubCategoryId == subCategoryId.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(m => m.NameThai.ToLower().Contains(term)
                || m.NameEnglish.ToLower().Contains(term));
        }

        var menus = await query
            .OrderByDescending(m => m.IsPinned)
            .ThenBy(m => m.SubCategory.SortOrder)
            .ThenBy(m => m.NameThai)
            .ToListAsync(ct);

        return menus.Select(m => new CustomerMenuItemResponseModel
        {
            MenuId = m.MenuId,
            CategoryType = m.SubCategory.CategoryType,
            Name = m.NameThai,
            NameEn = m.NameEnglish,
            Price = m.Price,
            ImageFileId = m.ImageFileId,
            IsRecommended = (m.Tags & (int)EMenuTag.Recommended) != 0,
            IsNew = (m.Tags & (int)EMenuTag.Seasonal) != 0,
            IsPinned = m.IsPinned,
            Tags = m.Tags,
            HasOptions = m.MenuOptionGroups.Any(),
            CaloriesPerServing = m.CaloriesPerServing,
            Allergens = m.Allergens
        }).ToList();
    }

    public async Task<CustomerMenuDetailResponseModel> GetMenuDetailAsync(int menuId, CancellationToken ct = default)
    {
        var menu = await _unitOfWork.Menus.QueryNoTracking()
            .Include(m => m.MenuOptionGroups)
                .ThenInclude(mog => mog.OptionGroup)
                    .ThenInclude(og => og.OptionItems.Where(oi => oi.IsActive))
            .FirstOrDefaultAsync(m => m.MenuId == menuId && m.IsAvailable, ct)
            ?? throw new EntityNotFoundException("Menu", menuId);

        return new CustomerMenuDetailResponseModel
        {
            MenuId = menu.MenuId,
            Name = menu.NameThai,
            NameEn = menu.NameEnglish,
            Description = menu.Description,
            Price = menu.Price,
            ImageFileId = menu.ImageFileId,
            IsRecommended = (menu.Tags & (int)EMenuTag.Recommended) != 0,
            IsNew = (menu.Tags & (int)EMenuTag.Seasonal) != 0,
            OptionGroups = menu.MenuOptionGroups
                .Where(mog => mog.OptionGroup.IsActive && !mog.OptionGroup.DeleteFlag)
                .OrderBy(mog => mog.SortOrder)
                .Select(mog => new CustomerOptionGroupModel
                {
                    OptionGroupId = mog.OptionGroup.OptionGroupId,
                    Name = mog.OptionGroup.Name,
                    IsRequired = mog.OptionGroup.IsRequired,
                    MaxSelections = mog.OptionGroup.MaxSelect ?? 0,
                    Items = mog.OptionGroup.OptionItems
                        .Where(oi => !oi.DeleteFlag)
                        .OrderBy(oi => oi.SortOrder)
                        .Select(oi => new CustomerOptionItemModel
                        {
                            OptionItemId = oi.OptionItemId,
                            Name = oi.Name,
                            AdditionalPrice = oi.AdditionalPrice
                        }).ToList()
                }).ToList()
        };
    }

    public async Task<CustomerOrderResponseModel> SubmitOrderAsync(
        int sessionId, int tableId, CustomerSubmitOrderRequestModel request, CancellationToken ct = default)
    {
        if (request.Items.Count == 0)
            throw new ValidationException("กรุณาเลือกเมนูอย่างน้อย 1 รายการ");

        var table = await _unitOfWork.Tables.GetAll()
            .FirstOrDefaultAsync(t => t.TableId == tableId && !t.DeleteFlag, ct)
            ?? throw new EntityNotFoundException("Table", tableId);

        if (table.Status != ETableStatus.Occupied)
            throw new BusinessException("โต๊ะถูกปิดแล้ว ไม่สามารถสั่งอาหารได้");

        // Get or find active order
        var order = await _unitOfWork.Orders.GetAll()
            .FirstOrDefaultAsync(o => o.TableId == tableId && o.Status == EOrderStatus.Open, ct)
            ?? throw new BusinessException("ไม่พบออเดอร์ที่เปิดอยู่ กรุณาแจ้งพนักงาน");

        var orderedBy = $"customer:{sessionId}";
        var createdItems = new List<TbOrderItem>();

        foreach (var itemReq in request.Items)
        {
            var menu = await _unitOfWork.Menus.QueryNoTracking()
                .Include(m => m.SubCategory)
                .FirstOrDefaultAsync(m => m.MenuId == itemReq.MenuId, ct)
                ?? throw new EntityNotFoundException("Menu", itemReq.MenuId);

            if (!menu.IsAvailable)
                throw new BusinessException($"เมนู \"{menu.NameThai}\" ไม่พร้อมจำหน่าย");

            var orderItem = new TbOrderItem
            {
                OrderId = order.OrderId,
                MenuId = menu.MenuId,
                MenuNameThai = menu.NameThai,
                MenuNameEnglish = menu.NameEnglish,
                CategoryType = menu.SubCategory.CategoryType,
                Quantity = itemReq.Quantity,
                UnitPrice = menu.Price,
                CostPrice = menu.CostPrice,
                Note = itemReq.Note,
                OrderedBy = orderedBy,
                Status = EOrderItemStatus.Sent,
                SentToKitchenAt = DateTime.UtcNow
            };

            decimal optionsTotal = 0;

            if (itemReq.OptionItemIds != null)
            {
                foreach (var optionItemId in itemReq.OptionItemIds)
                {
                    var optItem = await _unitOfWork.OptionGroups.QueryNoTracking()
                        .SelectMany(og => og.OptionItems)
                        .Include(oi => oi.OptionGroup)
                        .FirstOrDefaultAsync(oi => oi.OptionItemId == optionItemId && oi.IsActive, ct)
                        ?? throw new EntityNotFoundException("OptionItem", optionItemId);

                    orderItem.OrderItemOptions.Add(new TbOrderItemOption
                    {
                        OptionGroupId = optItem.OptionGroupId,
                        OptionItemId = optItem.OptionItemId,
                        OptionGroupName = optItem.OptionGroup.Name,
                        OptionItemName = optItem.Name,
                        AdditionalPrice = optItem.AdditionalPrice
                    });

                    optionsTotal += optItem.AdditionalPrice;
                }
            }

            orderItem.OptionsTotalPrice = optionsTotal;
            orderItem.TotalPrice = (menu.Price + optionsTotal) * itemReq.Quantity;

            await _unitOfWork.OrderItems.AddAsync(orderItem, ct);
            createdItems.Add(orderItem);
        }

        await _unitOfWork.CommitAsync(ct);

        // Recalculate order subtotal
        var allItems = await _unitOfWork.OrderItems.QueryNoTracking()
            .Where(i => i.OrderId == order.OrderId
                && i.Status != EOrderItemStatus.Voided
                && i.Status != EOrderItemStatus.Cancelled)
            .ToListAsync(ct);

        order.SubTotal = allItems.Sum(i => i.TotalPrice);
        _unitOfWork.Orders.Update(order);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Customer {SessionId} submitted {Count} items to Order {OrderId}",
            sessionId, request.Items.Count, order.OrderId);

        // Notify kitchen
        await _orderNotificationService.NotifyNewOrderItemsAsync(order.OrderId, tableId, ct);

        await _notificationBroadcaster.SendAndBroadcastAsync(new SendNotificationModel
        {
            EventType = "NEW_ORDER",
            Title = "ออเดอร์ใหม่จากลูกค้า",
            Message = $"ออเดอร์ #{order.OrderNumber.Split('-').Last()} — {request.Items.Count} รายการ (สั่งผ่าน QR)",
            TableId = tableId,
            OrderId = order.OrderId,
            TargetGroup = "Kitchen"
        }, ct);

        return new CustomerOrderResponseModel
        {
            OrderId = order.OrderId,
            TotalPrice = createdItems.Sum(i => i.TotalPrice),
            Items = createdItems.Select(i => new CustomerOrderItemResultModel
            {
                OrderItemId = i.OrderItemId,
                MenuName = i.MenuNameThai,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.TotalPrice
            }).ToList()
        };
    }

    public async Task<CustomerOrderTrackingResponseModel> GetOrdersAsync(int tableId, CancellationToken ct = default)
    {
        var order = await _unitOfWork.Orders.QueryNoTracking()
            .Include(o => o.OrderItems.Where(i => i.Status != EOrderItemStatus.Voided))
            .FirstOrDefaultAsync(o => o.TableId == tableId && o.Status == EOrderStatus.Open, ct);

        if (order == null)
        {
            return new CustomerOrderTrackingResponseModel();
        }

        return new CustomerOrderTrackingResponseModel
        {
            OrderId = order.OrderId,
            OrderNumber = order.OrderNumber,
            SubTotal = order.SubTotal,
            Items = order.OrderItems
                .OrderByDescending(i => i.CreatedAt)
                .Select(i => new CustomerTrackingItemModel
                {
                    OrderItemId = i.OrderItemId,
                    MenuName = i.MenuNameThai,
                    Quantity = i.Quantity,
                    TotalPrice = i.TotalPrice,
                    Status = i.Status.ToString(),
                    OrderedBy = FormatOrderedBy(i.OrderedBy)
                }).ToList()
        };
    }

    public async Task CallWaiterAsync(int sessionId, int tableId, CancellationToken ct = default)
    {
        var table = await _unitOfWork.Tables.QueryNoTracking()
            .Include(t => t.Zone)
            .FirstOrDefaultAsync(t => t.TableId == tableId && !t.DeleteFlag, ct)
            ?? throw new EntityNotFoundException("Table", tableId);

        _logger.LogInformation("Customer {SessionId} called waiter for Table {TableId}", sessionId, tableId);

        await _notificationBroadcaster.SendAndBroadcastAsync(new SendNotificationModel
        {
            EventType = "CALL_WAITER",
            Title = "ลูกค้าเรียกพนักงาน",
            Message = $"โซน{table.Zone.ZoneName} - โต๊ะ{table.TableName}",
            TableId = tableId,
            TargetGroup = "Floor"
        }, ct);
    }

    public async Task RequestBillAsync(int sessionId, int tableId, CancellationToken ct = default)
    {
        var table = await _unitOfWork.Tables.GetAll()
            .Include(t => t.Zone)
            .FirstOrDefaultAsync(t => t.TableId == tableId && !t.DeleteFlag, ct)
            ?? throw new EntityNotFoundException("Table", tableId);

        if (table.Status == ETableStatus.Billing)
            throw new BusinessException("โต๊ะนี้ขอบิลไปแล้ว");

        if (table.Status != ETableStatus.Occupied)
            throw new BusinessException("โต๊ะไม่ได้อยู่ในสถานะใช้งาน");

        var order = await _unitOfWork.Orders.GetAll()
            .FirstOrDefaultAsync(o => o.TableId == tableId && o.Status == EOrderStatus.Open, ct)
            ?? throw new BusinessException("ไม่พบออเดอร์ที่เปิดอยู่");

        // Change status to Billing
        order.Status = EOrderStatus.Billing;
        _unitOfWork.Orders.Update(order);

        table.Status = ETableStatus.Billing;
        _unitOfWork.Tables.Update(table);

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Customer {SessionId} requested bill for Table {TableId}, Order {OrderId}",
            sessionId, tableId, order.OrderId);

        await _orderNotificationService.NotifyOrderUpdatedAsync(order.OrderId, "Billing", ct);
        await _orderNotificationService.NotifyTableStatusChangedAsync(tableId, "Billing", ct);

        await _notificationBroadcaster.SendAndBroadcastAsync(new SendNotificationModel
        {
            EventType = "REQUEST_BILL",
            Title = "ลูกค้าขอบิล",
            Message = $"โซน{table.Zone.ZoneName} - โต๊ะ{table.TableName} — ออเดอร์ #{order.OrderNumber.Split('-').Last()}",
            TableId = tableId,
            OrderId = order.OrderId,
            TargetGroup = "Floor"
        }, ct);
    }

    public async Task RequestCashPaymentAsync(int sessionId, int tableId, CancellationToken ct = default)
    {
        var table = await _unitOfWork.Tables.QueryNoTracking()
            .Include(t => t.Zone)
            .FirstOrDefaultAsync(t => t.TableId == tableId && !t.DeleteFlag, ct)
            ?? throw new EntityNotFoundException("Table", tableId);

        var order = await _unitOfWork.Orders.QueryNoTracking()
            .FirstOrDefaultAsync(o => o.TableId == tableId && o.Status == EOrderStatus.Billing, ct)
            ?? throw new BusinessException("ไม่พบบิลที่กำลังรอชำระ");

        _logger.LogInformation("Customer {SessionId} requested cash payment for Table {TableId}, Order {OrderId}",
            sessionId, tableId, order.OrderId);

        await _notificationBroadcaster.SendAndBroadcastAsync(new SendNotificationModel
        {
            EventType = "REQUEST_CASH_PAYMENT",
            Title = "ลูกค้าขอชำระเงินสด",
            Message = $"โซน{table.Zone.ZoneName} - โต๊ะ{table.TableName} — ออเดอร์ #{order.OrderNumber.Split('-').Last()}",
            TableId = tableId,
            OrderId = order.OrderId,
            TargetGroup = "Floor"
        }, ct);
    }

    public async Task RequestSplitBillAsync(int sessionId, int tableId, RequestSplitBillModel request, CancellationToken ct = default)
    {
        var table = await _unitOfWork.Tables.QueryNoTracking()
            .Include(t => t.Zone)
            .FirstOrDefaultAsync(t => t.TableId == tableId && !t.DeleteFlag, ct)
            ?? throw new EntityNotFoundException("Table", tableId);

        var order = await _unitOfWork.Orders.QueryNoTracking()
            .FirstOrDefaultAsync(o => o.TableId == tableId && o.Status == EOrderStatus.Billing, ct)
            ?? throw new BusinessException("ไม่พบบิลที่กำลังรอชำระ");

        var dailyNo = order.OrderNumber.Split('-').Last();
        var message = request.SplitType == "Equal"
            ? $"โซน{table.Zone.ZoneName} - โต๊ะ{table.TableName} — ออเดอร์ #{dailyNo} ขอหารเท่า {request.NumberOfPeople} คน"
            : $"โซน{table.Zone.ZoneName} - โต๊ะ{table.TableName} — ออเดอร์ #{dailyNo} ขอแยกตามรายการ (กรุณาไปพูดคุยกับลูกค้า)";

        _logger.LogInformation("Customer {SessionId} requested split bill ({SplitType}) for Table {TableId}, Order {OrderId}",
            sessionId, request.SplitType, tableId, order.OrderId);

        await _notificationBroadcaster.SendAndBroadcastAsync(new SendNotificationModel
        {
            EventType = "REQUEST_SPLIT_BILL",
            Title = "ลูกค้าขอแยกบิล",
            Message = message,
            TableId = tableId,
            OrderId = order.OrderId,
            TargetGroup = "Floor"
        }, ct);
    }

    public async Task<ReceiptDataModel> GetCustomerReceiptAsync(int tableId, int orderBillId, CancellationToken ct = default)
    {
        // Validate orderBillId belongs to this table
        var bill = await _unitOfWork.OrderBills.QueryNoTracking()
            .Include(b => b.Order)
            .FirstOrDefaultAsync(b => b.OrderBillId == orderBillId, ct)
            ?? throw new EntityNotFoundException("OrderBill", orderBillId);

        if (bill.Order.TableId != tableId)
            throw new BusinessException("บิลนี้ไม่ได้อยู่ในโต๊ะของคุณ");

        if (bill.Status != EBillStatus.Paid)
            throw new BusinessException("บิลยังไม่ได้ชำระเงิน");

        // Find payment for this bill
        var payment = await _unitOfWork.Payments.QueryNoTracking()
            .FirstOrDefaultAsync(p => p.OrderBillId == orderBillId, ct)
            ?? throw new BusinessException("ไม่พบข้อมูลการชำระเงิน");

        return await _paymentService.GetReceiptDataAsync(payment.PaymentId, ct);
    }

    private (int tableId, string nonce) DecodeQrToken(string qrToken)
    {
        var secret = _configuration["Jwt:Secret"] ?? "";
        var issuer = _configuration["Jwt:Issuer"] ?? "RBMS.POS.API";

        var tokenHandler = new JwtSecurityTokenHandler();
        try
        {
            var principal = tokenHandler.ValidateToken(qrToken, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
                ValidateIssuer = true,
                ValidIssuer = issuer,
                ValidateAudience = true,
                ValidAudience = "RBMS.POS.QR",
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(1)
            }, out _);

            var tableIdClaim = principal.FindFirst("tableId")?.Value
                ?? throw new BusinessException("QR Code ไม่ถูกต้อง");
            var nonceClaim = principal.FindFirst("nonce")?.Value
                ?? throw new BusinessException("QR Code ไม่ถูกต้อง");

            return (int.Parse(tableIdClaim), nonceClaim);
        }
        catch (SecurityTokenException)
        {
            throw new BusinessException("QR Code หมดอายุ กรุณาแจ้งพนักงาน");
        }
    }

    private static string FormatOrderedBy(string orderedBy)
    {
        if (orderedBy.StartsWith("customer:"))
            return "ลูกค้า";

        return orderedBy;
    }
}
