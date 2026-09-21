using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace Markas.Controllers;

[ApiController, Route("api/products")]
public class ProductsController(StoreDb db) : ControllerBase
{
    [HttpGet] public async Task<IActionResult> List() => Ok(await db.Products.Where(p => !p.Deleted).AsNoTracking().OrderBy(p => p.Id).ToListAsync());
    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var p = await db.Products.SingleOrDefaultAsync(p => p.Id == id && !p.Deleted); return p is null ? NotFound() : Ok(p);
    }
    [HttpPost]
    public async Task<IActionResult> Create(Product input)
    {
        input.Id = 0; input.Deleted = false; input.Version = Guid.NewGuid(); db.Products.Add(input); await db.SaveChangesAsync(); return CreatedAtAction(nameof(Get), new { id = input.Id }, input);
    }
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Product input)
    {
        var p = await db.Products.SingleOrDefaultAsync(p => p.Id == id && !p.Deleted); if (p is null) return NotFound();
        if (p.Version != input.Version) return Conflict(new { message = "Ürün başka bir işlemde değişti. Tabloyu yenileyin." });
        p.Name = input.Name; p.Barcode = input.Barcode; p.Category = input.Category; p.Stock = input.Stock; p.MinStock = input.MinStock; p.PriceCents = input.PriceCents; p.Version = Guid.NewGuid();
        await db.SaveChangesAsync(); return Ok(p);
    }
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromQuery] Guid version)
    {
        var p = await db.Products.SingleOrDefaultAsync(p => p.Id == id && !p.Deleted); if (p is null) return NotFound();
        if (p.Version != version) return Conflict(); p.Deleted = true; p.Version = Guid.NewGuid(); await db.SaveChangesAsync(); return NoContent();
    }
}
