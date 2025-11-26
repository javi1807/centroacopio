import React from 'react';
import { Check } from 'lucide-react';

const ProcessSteps = ({ currentStep }) => {
    const steps = [
        { number: 1, label: 'Recepción' },
        { number: 2, label: 'Calidad' },
        { number: 3, label: 'Almacén' }
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
            <div className="flex items-center justify-between relative max-w-3xl mx-auto">
                {/* Background Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10"></div>

                {/* Active Line Progress */}
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-100 -z-10 transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step) => {
                    const isActive = step.number === currentStep;
                    const isCompleted = step.number < currentStep;

                    return (
                        <div key={step.number} className="flex flex-col items-center gap-2 bg-white px-4">
                            <div
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center font-bold ring-4 ring-white transition-all duration-300
                                    ${isActive
                                        ? 'bg-green-600 text-white shadow-lg shadow-green-200 scale-110'
                                        : isCompleted
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                                    }
                                `}
                            >
                                {isCompleted ? <Check className="h-5 w-5" /> : step.number}
                            </div>
                            <span
                                className={`
                                    text-sm font-medium transition-colors duration-300
                                    ${isActive ? 'text-gray-900 font-bold' : 'text-gray-500'}
                                `}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProcessSteps;
