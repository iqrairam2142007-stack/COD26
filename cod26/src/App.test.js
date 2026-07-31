import { render, screen } from "@testing-library/react";
import App from "./App";

test("shows a loading state while the session rehydrates", () => {
  render(<App />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});
