using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class PaymentRepository : GenericRepository<TbPayment>, IPaymentRepository
{
    public PaymentRepository(POSMainContext context) : base(context)
    {
    }
}
