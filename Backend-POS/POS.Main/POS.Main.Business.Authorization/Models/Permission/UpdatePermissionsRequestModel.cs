namespace POS.Main.Business.Authorization.Models.Permission;

public class UpdatePermissionsRequestModel
{
    public List<int> AuthorizeMatrixIds { get; set; } = new();
}
