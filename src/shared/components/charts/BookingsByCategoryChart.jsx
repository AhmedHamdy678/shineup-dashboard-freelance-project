import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function BookingsByCategoryChart({ data }) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value}%`, name]} />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-2 space-y-1 px-2">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-600">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="font-medium text-gray-700">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
