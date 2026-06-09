import type { Beneficiary } from "../../features/beneficiary/beneficiary.types";

interface BeneficiarySidebarProps {
  beneficiaries: Beneficiary[];
}

const POPULAR_BANKS = ["HDFC", "ICICI", "SBI", "Axis", "Kotak", "BOB"];

const BeneficiarySidebar = ({ beneficiaries }: BeneficiarySidebarProps) => {
  const list = Array.isArray(beneficiaries) ? beneficiaries : [];
  const recent = list.slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Recent Beneficiaries */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Recent Beneficiaries</h4>
        {recent.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No beneficiaries added</p>
        ) : (
          <div className="space-y-3">
            {recent.map((b) => (
              <div key={b._id} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-800">{b.beneficiaryName}</p>
                  <p className="text-[10px] text-gray-500">{b.bankName}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popular Banks */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Popular Banks</h4>
        <div className="grid grid-cols-3 gap-2">
          {POPULAR_BANKS.map((bank) => (
            <div key={bank} className="flex items-center justify-center py-2 px-1 rounded-lg bg-gray-50 border border-gray-100">
              <span className="text-xs font-medium text-gray-700">{bank}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
        <h4 className="text-sm font-semibold text-blue-800 mb-3">Important Guidelines</h4>
        <ul className="space-y-2 text-xs text-blue-700">
          <li className="flex gap-2"><span>•</span>Verify account number carefully</li>
          <li className="flex gap-2"><span>•</span>Verify IFSC code before adding</li>
          <li className="flex gap-2"><span>•</span>Activation may take up to 24 hours</li>
          <li className="flex gap-2"><span>•</span>Avoid adding incorrect accounts</li>
        </ul>
      </div>
    </div>
  );
};

export default BeneficiarySidebar;
