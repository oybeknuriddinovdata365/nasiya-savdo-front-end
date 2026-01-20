export function SkeletonRow() {
  return (
    <tr className="animate-pulse flex justify-between">
      <td className="p-4">
        <div className="h-7 w-40 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
      </td>
      <td className="p-4">
        <div className="h-7 w-40 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
      </td>
      <td className="p-4">
        <div className="h-7 w-40 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
      </td>
      <td className="p-4">
        <div className="h-7 w-40 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
      </td>
      <td className="p-4">
        <div className="h-7 w-40 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
      </td>
    </tr>
  );
}
