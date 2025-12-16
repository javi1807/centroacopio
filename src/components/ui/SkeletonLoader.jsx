import React from 'react';

/**
 * Skeleton loader component for loading states
 */
export const SkeletonLoader = ({ type = 'card', count = 1, className = '' }) => {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    </div>
                );

            case 'table-row':
                return (
                    <tr className={className}>
                        <td colSpan="100%" className="px-6 py-4">
                            <div className="animate-pulse flex space-x-4">
                                <div className="flex-1 space-y-3 py-1">
                                    <div className="h-3 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </td>
                    </tr>
                );

            case 'stat':
                return (
                    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
                        <div className="animate-pulse">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                            </div>
                            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    </div>
                );

            case 'text':
                return (
                    <div className={`animate-pulse ${className}`}>
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                );

            default:
                return (
                    <div className={`animate-pulse bg-gray-200 rounded h-20 ${className}`}></div>
                );
        }
    };

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <React.Fragment key={index}>
                    {renderSkeleton()}
                </React.Fragment>
            ))}
        </>
    );
};

export default SkeletonLoader;
