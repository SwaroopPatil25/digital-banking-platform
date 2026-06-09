import loginIcon from "../../assets/activity/login.svg";
import logoutIcon from "../../assets/activity/logout.svg";
import transferIcon from "../../assets/activity/transfer.svg";
import billPaymentIcon from "../../assets/activity/bill-payment.svg";
import beneficiaryAddedIcon from "../../assets/activity/beneficiary-added.svg";
import profileUpdateIcon from "../../assets/activity/profile-update.svg";
import passwordChangeIcon from "../../assets/activity/password-change.svg";
import statementDownloadIcon from "../../assets/activity/statement-download.svg";
import defaultIcon from "../../assets/activity/default.svg";
import emptyStateIcon from "../../assets/activity/empty-state.svg";

/** Maps activity action types to their corresponding SVG icon asset */
export const ACTIVITY_ICON_MAP: Record<string, string> = {
  LOGIN: loginIcon,
  LOGOUT: logoutIcon,
  TRANSFER: transferIcon,
  BILL_PAYMENT: billPaymentIcon,
  BENEFICIARY_ADDED: beneficiaryAddedIcon,
  PROFILE_UPDATE: profileUpdateIcon,
  PASSWORD_CHANGE: passwordChangeIcon,
  STATEMENT_DOWNLOAD: statementDownloadIcon,
};

export const DEFAULT_ACTIVITY_ICON = defaultIcon;
export const EMPTY_STATE_ICON = emptyStateIcon;

/** Returns the correct icon for a given activity action type */
export const getActivityIcon = (action: string): string =>
  ACTIVITY_ICON_MAP[action] || DEFAULT_ACTIVITY_ICON;
