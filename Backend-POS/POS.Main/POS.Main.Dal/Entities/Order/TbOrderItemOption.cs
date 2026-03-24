namespace POS.Main.Dal.Entities;

public class TbOrderItemOption
{
    public int OrderItemOptionId { get; set; }

    public int OrderItemId { get; set; }
    public virtual TbOrderItem OrderItem { get; set; } = null!;

    public int OptionGroupId { get; set; }
    public virtual TbOptionGroup OptionGroup { get; set; } = null!;

    public int OptionItemId { get; set; }
    public virtual TbOptionItem OptionItem { get; set; } = null!;

    public string OptionGroupName { get; set; } = string.Empty;

    public string OptionItemName { get; set; } = string.Empty;

    public decimal AdditionalPrice { get; set; }
}
