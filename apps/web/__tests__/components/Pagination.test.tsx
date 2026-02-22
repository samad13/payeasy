import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination from "@/components/Pagination";

describe("Pagination Component", () => {
    const mockOnPageChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders page navigation and basic buttons", () => {
        render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);

        expect(screen.getByRole("navigation", { name: /Pagination/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Go to previous page" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Go to next page" })).toBeInTheDocument();

        for (let i = 1; i <= 5; i++) {
            expect(screen.getByRole("button", { name: `Go to page ${i}` })).toBeInTheDocument();
        }
    });

    it("disables previous button on the first page and next button on the last page", () => {
        const { rerender } = render(
            <Pagination currentPage={1} totalPages={10} onPageChange={mockOnPageChange} />
        );
        expect(screen.getByRole("button", { name: "Go to previous page" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Go to next page" })).not.toBeDisabled();

        rerender(<Pagination currentPage={10} totalPages={10} onPageChange={mockOnPageChange} />);
        expect(screen.getByRole("button", { name: "Go to previous page" })).not.toBeDisabled();
        expect(screen.getByRole("button", { name: "Go to next page" })).toBeDisabled();
    });

    it("calls onPageChange with correct page numbers when navigation buttons are clicked", () => {
        render(<Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />);

        fireEvent.click(screen.getByRole("button", { name: "Go to previous page" }));
        expect(mockOnPageChange).toHaveBeenCalledWith(4);

        fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));
        expect(mockOnPageChange).toHaveBeenCalledWith(6);

        fireEvent.click(screen.getByRole("button", { name: "Go to page 8" }));
        expect(mockOnPageChange).toHaveBeenCalledWith(8);
    });

    it("renders ellipsis dots correctly for large page ranges", () => {
        const { rerender } = render(
            <Pagination currentPage={1} totalPages={10} onPageChange={mockOnPageChange} />
        );
        // At page 1: 1, 2, 3, 4, ..., 10
        expect(screen.queryByRole("button", { name: "Go to page 2" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Go to page 5" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Go to page 10" })).toBeInTheDocument();

        rerender(<Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />);
        // At page 5: 1, ..., 4, 5, 6, ..., 10
        expect(screen.queryByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Go to page 4" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Go to page 6" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Go to page 10" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Go to page 2" })).not.toBeInTheDocument();

        rerender(<Pagination currentPage={9} totalPages={10} onPageChange={mockOnPageChange} />);
        // At page 9: 1, ..., 7, 8, 9, 10
        expect(screen.queryByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Go to page 7" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Go to page 9" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Go to page 2" })).not.toBeInTheDocument();
    });

    it("displays results info accurate to the current page and total results", () => {
        const { rerender } = render(
            <Pagination
                currentPage={1}
                totalPages={5}
                pageSize={10}
                totalResults={45}
                onPageChange={mockOnPageChange}
            />
        );
        expect(screen.getByText("Showing 1–10 of 45 results")).toBeInTheDocument();

        rerender(
            <Pagination
                currentPage={5}
                totalPages={5}
                pageSize={10}
                totalResults={45}
                onPageChange={mockOnPageChange}
            />
        );
        expect(screen.getByText("Showing 41–45 of 45 results")).toBeInTheDocument();

        rerender(
            <Pagination
                currentPage={1}
                totalPages={1}
                pageSize={10}
                totalResults={0}
                onPageChange={mockOnPageChange}
            />
        );
        expect(screen.getByText("Showing 0 results")).toBeInTheDocument();
    });

    it("validates jump to page input correctly and refuses out-of-range navigation", async () => {
        render(<Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />);

        const input = screen.getByLabelText("Page number to jump to");
        const goButton = screen.getByRole("button", { name: "Submit jump to page" });

        // Ensure Go button is disabled initially
        expect(goButton).toBeDisabled();

        // Valid jump
        await userEvent.type(input, "8");
        expect(goButton).not.toBeDisabled();
        fireEvent.click(goButton);
        expect(mockOnPageChange).toHaveBeenCalledWith(8);
        expect(input).toHaveValue(""); // Should clear on valid submit

        mockOnPageChange.mockClear();

        // Invalid jump - letters
        await userEvent.type(input, "abc");
        // Because pattern limits to numbers, input might not even allow letters if relying on HTML5 validation, but in React state it depends.
        // It should parse to NaN and not navigate.
        fireEvent.click(goButton);
        expect(mockOnPageChange).not.toHaveBeenCalled();

        mockOnPageChange.mockClear();

        // Invalid jump - out of range (too high)
        fireEvent.change(input, { target: { value: "15" } });
        fireEvent.click(goButton);
        expect(mockOnPageChange).not.toHaveBeenCalled();

        mockOnPageChange.mockClear();

        // Invalid jump - out of range (too low)
        fireEvent.change(input, { target: { value: "0" } });
        fireEvent.click(goButton);
        expect(mockOnPageChange).not.toHaveBeenCalled();
    });

    it("supports keyboard navigation for interactive elements", async () => {
        render(<Pagination currentPage={1} totalPages={10} onPageChange={mockOnPageChange} />);

        const nextButton = screen.getByRole("button", { name: "Go to next page" });
        const page2Button = screen.getByRole("button", { name: "Go to page 2" });

        nextButton.focus();
        expect(nextButton).toHaveFocus();

        fireEvent.keyDown(nextButton, { key: "Enter", code: "Enter", charCode: 13 });
        // The click event is simulated natively by enter on buttons, but we'll use userEvent or ensure it focuses ok.
        await userEvent.keyboard("[Enter]"); // user event handles enter appropriately if focused
        expect(mockOnPageChange).toHaveBeenCalledWith(2);

        page2Button.focus();
        expect(page2Button).toHaveFocus();
    });
});
