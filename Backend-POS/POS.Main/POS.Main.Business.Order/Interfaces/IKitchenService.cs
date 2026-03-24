using POS.Main.Business.Order.Models.Kitchen;

namespace POS.Main.Business.Order.Interfaces;

public interface IKitchenService
{
    Task<List<KitchenOrderModel>> GetKitchenItemsAsync(int categoryType, bool includeReady = false, CancellationToken ct = default);
    Task StartPreparingAsync(List<int> orderItemIds, CancellationToken ct = default);
    Task MarkReadyAsync(List<int> orderItemIds, CancellationToken ct = default);
}
