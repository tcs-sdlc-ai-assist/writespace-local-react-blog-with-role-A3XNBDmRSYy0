import PropTypes from 'prop-types';

/**
 * StatCard component for displaying a single statistic tile on the admin dashboard.
 * @param {Object} props
 * @param {string} props.label - The label describing the statistic.
 * @param {number|string} props.value - The numeric or string value to display.
 * @param {string} [props.icon] - An emoji or icon string to display.
 * @param {string} [props.gradient] - Tailwind gradient classes for the background.
 * @returns {JSX.Element}
 */
export function StatCard({ label, value, icon, gradient }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg shadow-md p-5 text-white ${gradient}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90">{label}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
        </div>
        {icon && (
          <span className="text-4xl opacity-80" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.string,
  gradient: PropTypes.string,
};

StatCard.defaultProps = {
  icon: undefined,
  gradient: 'bg-gradient-to-br from-primary-500 to-primary-700',
};

export default StatCard;