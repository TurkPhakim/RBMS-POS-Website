using POS.Main.Business.Table.Models.FloorObject;

namespace POS.Main.Business.Table.Interfaces;

public interface IFloorObjectService
{
    Task<List<FloorObjectResponseModel>> GetFloorObjectsAsync(int? zoneId, CancellationToken ct = default);
    Task<FloorObjectResponseModel> CreateFloorObjectAsync(CreateFloorObjectRequestModel request, CancellationToken ct = default);
    Task<FloorObjectResponseModel> UpdateFloorObjectAsync(int floorObjectId, UpdateFloorObjectRequestModel request, CancellationToken ct = default);
    Task DeleteFloorObjectAsync(int floorObjectId, CancellationToken ct = default);
    Task UpdatePositionsAsync(UpdateFloorObjectPositionsRequestModel request, CancellationToken ct = default);
}
