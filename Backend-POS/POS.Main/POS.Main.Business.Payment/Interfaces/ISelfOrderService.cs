using POS.Main.Business.Payment.Models.Payment;
using POS.Main.Business.Payment.Models.SelfOrder;

namespace POS.Main.Business.Payment.Interfaces;

public interface ISelfOrderService
{
    Task<CustomerAuthResponseModel> AuthenticateAsync(CustomerAuthRequestModel request, CancellationToken ct = default);
    Task SetNicknameAsync(int sessionId, string nickname, CancellationToken ct = default);
    Task<CustomerMenuCategoriesResponseModel> GetMenuCategoriesAsync(CancellationToken ct = default);
    Task<List<CustomerMenuItemResponseModel>> GetMenuItemsAsync(int? categoryType, int? subCategoryId, string? search, CancellationToken ct = default);
    Task<CustomerMenuDetailResponseModel> GetMenuDetailAsync(int menuId, CancellationToken ct = default);
    Task<CustomerOrderResponseModel> SubmitOrderAsync(int sessionId, int tableId, CustomerSubmitOrderRequestModel request, CancellationToken ct = default);
    Task<CustomerOrderTrackingResponseModel> GetOrdersAsync(int tableId, CancellationToken ct = default);
    Task CallWaiterAsync(int sessionId, int tableId, CancellationToken ct = default);
    Task RequestBillAsync(int sessionId, int tableId, CancellationToken ct = default);
    Task RequestCashPaymentAsync(int sessionId, int tableId, CancellationToken ct = default);
    Task RequestSplitBillAsync(int sessionId, int tableId, RequestSplitBillModel request, CancellationToken ct = default);
    Task<ReceiptDataModel> GetCustomerReceiptAsync(int tableId, int orderBillId, CancellationToken ct = default);
}
