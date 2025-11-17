import { AlertCircle, CheckCircle, Circle, Clock } from "lucide-react";

export const EMPTY_FIELD_ERROR_TEXT = "Required";

// Lead Status Styles
export const STATUS_STYLES = {
  'New': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Contacted': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'Follow-up': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'Proposal Sent': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'In Negotiation': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  'Won': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'Lost': 'bg-red-500/10 text-red-500 border-red-500/20',
  'On-hold': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
} as const;

export const PROJECT_HEALTH = [
  {
    value: 'Good',
    label: 'Good',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    bgColor: 'bg-green-50'
  },
  {
    value: 'AT Risk',
    label: 'At Risk',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: Circle,
    bgColor: 'bg-red-50'
  },
  {
    value: 'Moderate',
    label: 'Moderate',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: AlertCircle,
    bgColor: 'bg-orange-50'
  }
];

export const ALLOWED_ROLES = ["CLIENT_PARTNER_ADMIN", "CLIENT_PARTNER", "SUPERADMIN"];

