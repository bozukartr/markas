using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace Markas.Controllers;

[ApiController, Route("api/sales")]
public class SalesController(StoreDb db, IConfiguration config) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(SaleRequest request)
    {
        if (request.Id == Guid.Empty) return BadRequest(new { message = "İşlem kimliği gerekli." });
        var store = config["StoreId"] ?? "demo-store";
        // A single SQLite transaction commits inventory and the durable outbox together.
        await using var tx = await db.Database.BeginTransactionAsync();
        var existing = await db.Sales.FindAsync(store, request.Id);
        if (existing is not null) return existing.ProductId == request.ProductId && existing.Quantity == request.Quantity ? Ok(existing) : Conflict(new { message = "İşlem kimliği farklı bir satışta kullanılmış." });
        var p = await db.Products.SingleOrDefaultAsync(p => p.Id == request.ProductId && !p.Deleted);
        if (p is null) return NotFound();
        if (p.Stock < request.Quantity) return Conflict(new { message = "Yeterli stok yok." });
        p.Stock -= request.Quantity;
        p.Version = Guid.NewGuid();
        var sale = new Sale { Id = request.Id, StoreId = store, ProductId = p.Id, ProductName = p.Name, Quantity = request.Quantity, UnitPriceCents = p.PriceCents, CreatedAt = DateTime.UtcNow };
        db.Sales.Add(sale);
        await db.SaveChangesAsync();
        await tx.CommitAsync();
        return Ok(sale);
    }
    [HttpGet("summary")]
    public async Task<IActionResult> Summary()
    {
        var start = DateTime.UtcNow.AddHours(3).Date.AddHours(-3);
        var sales = await db.Sales.Where(s => s.CreatedAt >= start).AsNoTracking().ToListAsync();
        return Ok(new { revenueCents = sales.Sum(s => s.UnitPriceCents * s.Quantity), saleCount = sales.Count, activeRegisters = 1, pending = await db.Sales.CountAsync(s => !s.Synced), cloudConfigured = !string.IsNullOrWhiteSpace(config["Cloud:Url"]), recent = sales.OrderByDescending(s => s.CreatedAt).Take(5) });
    }
}
