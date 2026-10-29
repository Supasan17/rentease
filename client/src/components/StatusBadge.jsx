/**
 * Status Badge Component
 *
 * Small coloured pill showing a rental's status.
 */

import { STATUS_STYLES } from '../utils/rentals.js';

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
        STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
