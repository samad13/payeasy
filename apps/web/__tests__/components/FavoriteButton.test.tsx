import "@testing-library/jest-dom";

// Mock the hook from the provider
import * as FavoritesProviderMock from "@/components/FavoritesProvider";

import { act, fireEvent, screen } from "@testing-library/react";

import FavoriteButton from "@/components/FavoriteButton";
import React from "react";
import { render } from "@/utils/test-utils";

jest.mock("@/components/FavoritesProvider", () => {
  const original = jest.requireActual("@/components/FavoritesProvider");
  return {
    __esModule: true,
    ...original,
    useFavoritesContext: jest.fn(),
  };
});

// Alias the mocked hook for easier use in tests
const useFavoritesContext = FavoritesProviderMock.useFavoritesContext as jest.Mock;

describe("FavoriteButton Component", () => {
  const mockToggleFavorite = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useFavoritesContext.mockReturnValue({
      isFavorited: () => false,
      toggleFavorite: mockToggleFavorite,
      isLoading: false,
    });
  });

  it.skip("renders a heart icon with Add to favorites label when not favorited", () => {
    render(<FavoriteButton listingId="test-123" />);

    const button = screen.getByRole("button", { name: /add to favorites/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();

    const svg = button.querySelector("svg");
    expect(svg).toHaveClass("fill-transparent");
  });

  it.skip("renders a heart icon with Remove from favorites label when favorited", () => {
    useFavoritesContext.mockReturnValue({
      isFavorited: (id: string) => id === "test-123",
      toggleFavorite: mockToggleFavorite,
      isLoading: false,
    });

    render(<FavoriteButton listingId="test-123" />);

    const button = screen.getByRole("button", { name: /remove from favorites/i });
    expect(button).toBeInTheDocument();

    const svg = button.querySelector("svg");
    expect(svg).toHaveClass("fill-red-500");
  });

  it.skip("calls toggleFavorite when clicked", () => {
    render(<FavoriteButton listingId="test-123" />);

    const button = screen.getByRole("button", { name: /add to favorites/i });
    fireEvent.click(button);

    expect(mockToggleFavorite).toHaveBeenCalledTimes(1);
    expect(mockToggleFavorite).toHaveBeenCalledWith("test-123");
  });

  it.skip("is disabled when loading", () => {
    useFavoritesContext.mockReturnValue({
      isFavorited: () => false,
      toggleFavorite: mockToggleFavorite,
      isLoading: true,
    });

    render(<FavoriteButton listingId="test-123" />);

    const button = screen.getByRole("button", { name: /add to favorites/i });
    expect(button).toBeDisabled();
  });
});
