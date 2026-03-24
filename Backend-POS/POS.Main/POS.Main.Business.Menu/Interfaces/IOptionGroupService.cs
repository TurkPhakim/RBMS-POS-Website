using POS.Main.Business.Menu.Models.OptionGroup;
using POS.Main.Core.Models;

namespace POS.Main.Business.Menu.Interfaces;

public interface IOptionGroupService
{
    Task<PaginationResult<OptionGroupResponseModel>> GetOptionGroupsAsync(
        int categoryType, PaginationModel param, CancellationToken ct = default);

    Task<PaginationResult<OptionGroupResponseModel>> GetOptionGroupsAsync(
        PaginationModel param, int? categoryType = null, bool? isActive = null, CancellationToken ct = default);

    Task<OptionGroupResponseModel> GetOptionGroupByIdAsync(
        int optionGroupId, CancellationToken ct = default);

    Task<OptionGroupResponseModel> CreateOptionGroupAsync(
        CreateOptionGroupRequestModel request, CancellationToken ct = default);

    Task<OptionGroupResponseModel> UpdateOptionGroupAsync(
        int optionGroupId, UpdateOptionGroupRequestModel request, CancellationToken ct = default);

    Task DeleteOptionGroupAsync(int optionGroupId, CancellationToken ct = default);
}
