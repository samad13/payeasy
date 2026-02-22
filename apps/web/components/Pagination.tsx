import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export interface PaginationProps {
    /** The current active page (1-indexed) */
    currentPage: number;
    /** The total number of pages */
    totalPages: number;
    /** Number of items per page */
    pageSize?: number;
    /** Total number of results across all pages */
    totalResults?: number;
    /** Size variant */
    size?: "sm" | "md" | "lg";
    /** Callback triggered when a page is selected */
    onPageChange: (page: number) => void;
}

export function Pagination({
    currentPage,
    totalPages,
    pageSize,
    totalResults,
    size = "md",
    onPageChange,
}: PaginationProps) {
    const [jumpPage, setJumpPage] = useState("");

    // Update jump input when current page changes externally
    useEffect(() => {
        setJumpPage("");
    }, [currentPage]);

    // Prevent invalid states
    if (totalPages < 1) return null;
    const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

    // Size mapping for buttons
    const sizeClasses = {
        sm: "h-8 px-2 text-xs",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base",
    };

    const iconSizeClasses = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
    };

    // Generate page numbers with ellipses logic
    const getPageNumbers = () => {
        const pages: (number | "ellipsis")[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (safeCurrentPage <= 3) {
                pages.push(1, 2, 3, 4, "ellipsis", totalPages);
            } else if (safeCurrentPage >= totalPages - 2) {
                pages.push(
                    1,
                    "ellipsis",
                    totalPages - 3,
                    totalPages - 2,
                    totalPages - 1,
                    totalPages
                );
            } else {
                pages.push(
                    1,
                    "ellipsis",
                    safeCurrentPage - 1,
                    safeCurrentPage,
                    safeCurrentPage + 1,
                    "ellipsis",
                    totalPages
                );
            }
        }
        return pages;
    };

    // Results calculation
    const getResultsInfo = () => {
        if (pageSize === undefined || totalResults === undefined) return null;
        if (totalResults === 0) return `Showing 0 results`;
        const start = (safeCurrentPage - 1) * pageSize + 1;
        const end = Math.min(safeCurrentPage * pageSize, totalResults);
        return `Showing ${start}–${end} of ${totalResults} results`;
    };

    const handleJumpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const pageNum = parseInt(jumpPage, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            onPageChange(pageNum);
            setJumpPage("");
        }
    };

    return (
        <nav
            aria-label="Pagination"
            className="flex flex-col items-center justify-between gap-4 sm:flex-row w-full text-slate-200"
        >
            {/* Results Info Section */}
            <div
                className={`text-slate-400 ${size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"
                    }`}
                aria-live="polite"
            >
                {getResultsInfo()}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Pagination Buttons Section */}
                <ul className="flex items-center gap-1 sm:gap-2">
                    {/* Previous Button */}
                    <li>
                        <button
                            type="button"
                            className={`flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 ${sizeClasses[size]}`}
                            onClick={() => onPageChange(safeCurrentPage - 1)}
                            disabled={safeCurrentPage === 1}
                            aria-label="Go to previous page"
                        >
                            <ChevronLeft className={iconSizeClasses[size]} aria-hidden={true} />
                        </button>
                    </li>

                    {/* Page Numbers */}
                    {getPageNumbers().map((page, index) => {
                        if (page === "ellipsis") {
                            return (
                                <li key={`ellipsis-${index}`} aria-hidden="true">
                                    <span
                                        className={`flex items-center justify-center text-slate-500 ${sizeClasses[size]}`}
                                    >
                                        <MoreHorizontal className={iconSizeClasses[size]} />
                                    </span>
                                </li>
                            );
                        }

                        const isActive = page === safeCurrentPage;
                        return (
                            <li key={page} className="hidden sm:block">
                                <button
                                    type="button"
                                    className={`flex items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isActive
                                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-400 font-semibold"
                                        : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                                        } ${sizeClasses[size]}`}
                                    onClick={() => onPageChange(page)}
                                    aria-label={`Go to page ${page}`}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    {page}
                                </button>
                            </li>
                        );
                    })}

                    {/* Current Page for Mobile (Simplified UI) */}
                    <li className="block sm:hidden flex items-center justify-center text-sm font-medium text-slate-300 px-2">
                        Page {safeCurrentPage} of {totalPages}
                    </li>

                    {/* Next Button */}
                    <li>
                        <button
                            type="button"
                            className={`flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 ${sizeClasses[size]}`}
                            onClick={() => onPageChange(safeCurrentPage + 1)}
                            disabled={safeCurrentPage === totalPages}
                            aria-label="Go to next page"
                        >
                            <ChevronRight className={iconSizeClasses[size]} aria-hidden={true} />
                        </button>
                    </li>
                </ul>

                {/* Jump to Page Section */}
                {totalPages > 5 && (
                    <form
                        onSubmit={handleJumpSubmit}
                        className="flex items-center gap-2"
                        aria-label="Jump to page form"
                    >
                        <label
                            htmlFor="jump-to-page"
                            className={`whitespace-nowrap text-slate-400 ${size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"
                                }`}
                        >
                            Jump to:
                        </label>
                        <input
                            id="jump-to-page"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className={`w-16 rounded-lg border border-slate-700 bg-slate-900 text-center text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${sizeClasses[size]}`}
                            value={jumpPage}
                            onChange={(e) => setJumpPage(e.target.value)}
                            placeholder="#"
                            aria-label="Page number to jump to"
                        />
                        <button
                            type="submit"
                            className={`rounded-lg border border-slate-700 bg-slate-800 font-medium text-slate-300 transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${sizeClasses[size]}`}
                            disabled={!jumpPage}
                            aria-label="Submit jump to page"
                        >
                            Go
                        </button>
                    </form>
                )}
            </div>
        </nav>
    );
}

export default Pagination;
