import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const Stepper = ({ 
    steps, 
    currentStep, 
    onStepClick = null,
    className = ""
}) => {
    return (
        <ul className={`relative flex flex-row gap-x-4 w-full max-w-5xl mx-auto ${className}`}>
            {steps.map((step, index) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                const isClickable = onStepClick && (isCompleted || index === 0 || steps[index-1]?.completed);
                
                return (
                    <li 
                        key={step.id}
                        className="shrink basis-0 flex-1 group"
                    >
                        <div className="min-w-10 min-h-10 w-full inline-flex items-center text-xs align-middle">
                            {/* Circle indicator - increased size */}
                            <button
                                type="button"
                                onClick={() => isClickable && onStepClick(step.id)}
                                disabled={!isClickable}
                                className={`size-10 flex justify-center items-center shrink-0 rounded-full ${
                                    isCompleted
                                        ? "bg-blue-600 text-white"
                                        : isCurrent
                                        ? "bg-blue-100 text-blue-800 ring-1 ring-blue-600"
                                        : "bg-gray-100 text-gray-800"
                                } ${
                                    isClickable ? "cursor-pointer hover:bg-blue-50" : "cursor-default"
                                } font-medium`}
                                aria-current={isCurrent ? "step" : undefined}
                                aria-label={`Step ${step.id}: ${step.name} ${
                                    isCompleted ? "completed" : isCurrent ? "current" : ""
                                }`}
                            >
                                {isCompleted ? (
                                    <CheckCircleIcon className="size-6" />
                                ) : (
                                    <span className="text-base">{step.id}</span>
                                )}
                            </button>
                            
                            {/* Connecting line - thicker */}
                            <div className="ms-3 w-full h-1 flex-1 bg-gray-200 group-last:hidden"></div>
                        </div>
                        
                        {/* Step label - larger text */}
                        <div className="mt-4">
                            <span className={`block text-base font-medium ${
                                isCompleted ? "text-blue-600" : 
                                isCurrent ? "text-blue-800" : 
                                "text-gray-800"
                            }`}>
                                {step.name}
                            </span>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

export default Stepper;