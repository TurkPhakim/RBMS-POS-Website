using POS.Main.Business.Table.Models.Table;
using POS.Main.Core.Models;

namespace POS.Main.Business.Table.Interfaces;

public interface ITableService
{
    Task<PaginationResult<TableResponseModel>> GetTablesAsync(
        int? zoneId, string? status, PaginationModel param, CancellationToken ct = default);

    Task<TableResponseModel> GetTableByIdAsync(int tableId, CancellationToken ct = default);

    Task<TableResponseModel> CreateTableAsync(CreateTableRequestModel request, CancellationToken ct = default);

    Task<TableResponseModel> UpdateTableAsync(int tableId, UpdateTableRequestModel request, CancellationToken ct = default);

    Task DeleteTableAsync(int tableId, CancellationToken ct = default);

    Task UpdatePositionsAsync(UpdateTablePositionsRequestModel request, CancellationToken ct = default);

    Task<TableResponseModel> OpenTableAsync(int tableId, OpenTableRequestModel request, CancellationToken ct = default);

    Task<TableResponseModel> CloseTableAsync(int tableId, CancellationToken ct = default);

    Task<TableResponseModel> CleanTableAsync(int tableId, CancellationToken ct = default);

    Task<TableResponseModel> MoveTableAsync(int tableId, MoveTableRequestModel request, CancellationToken ct = default);

    Task LinkTablesAsync(LinkTablesRequestModel request, CancellationToken ct = default);

    Task UnlinkTablesAsync(string groupCode, CancellationToken ct = default);

    Task<TableResponseModel> SetUnavailableAsync(int tableId, CancellationToken ct = default);

    Task<TableResponseModel> SetAvailableAsync(int tableId, CancellationToken ct = default);

    Task<string?> GetQrTokenAsync(int tableId, CancellationToken ct = default);
}
