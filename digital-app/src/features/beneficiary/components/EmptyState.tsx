import { BENEFICIARY_MESSAGES } from "../beneficiary.constants";
import usersIcon from "../../../assets/icons/users.svg";

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <img src={usersIcon} alt="No beneficiaries" className="w-12 h-12 mb-4 opacity-50" />
      <p className="text-slate-400 text-lg mb-4">
        {BENEFICIARY_MESSAGES.EMPTY_STATE}
      </p>
    </div>
  );
};

export default EmptyState;
