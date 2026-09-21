using System.ComponentModel.DataAnnotations;
namespace Markas;

public class Product
{
    public int Id { get; set; }
    [Required, StringLength(100)] public string Name { get; set; } = "";
    [Required, StringLength(40)] public string Barcode { get; set; } = "";
    [Required, StringLength(40)] public string Category { get; set; } = "";
    [Range(1, 100000000)] public long PriceCents { get; set; }
    [Range(0, 1000000)] public int Stock { get; set; }
    [Range(0, 1000000)] public int MinStock { get; set; } = 10;
    [ConcurrencyCheck] public Guid Version { get; set; } = Guid.NewGuid();
    public bool Deleted { get; set; }
}
public record SaleRequest(Guid Id, int ProductId, [Range(1, 1000)] int Quantity);
public class Sale
{
    public Guid Id { get; set; }
    public string StoreId { get; set; } = "";
    public int ProductId { get; set; }
    public string ProductName { get; set; } = "";
    public int Quantity { get; set; }
    public long UnitPriceCents { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool Synced { get; set; }
}
