using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace Markas.Controllers;

[ApiController, Route("api/sync")]
public class SyncController(StoreDb db, IConfiguration config) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Receive(Sale sale)
    {
        var key = config["Cloud:ApiKey"];
        if (string.IsNullOrWhiteSpace(key) || Request.Headers["X-Sync-Key"] != key) return Unauthorized();
        if (sale.StoreId != (config["StoreId"] ?? "demo-store")) return StatusCode(403);
        if (sale.Id == Guid.Empty || sale.Quantity is < 1 or > 1000 || sale.UnitPriceCents is < 1 or > 100000000 || sale.ProductName.Length > 100) return BadRequest();
        var old = await db.Sales.FindAsync(sale.StoreId, sale.Id);
        if (old is not null) return old.ProductId == sale.ProductId && old.Quantity == sale.Quantity && old.UnitPriceCents == sale.UnitPriceCents && old.CreatedAt == sale.CreatedAt ? Ok(new { sale.Id }) : Conflict();
        sale.Synced = true; db.Sales.Add(sale); await db.SaveChangesAsync(); return Ok(new { sale.Id });
    }
}
