import {fireEvent, render, screen} from '@testing-library/react'
import App from './App'
import {expect, it} from "vitest"

// Basic sanity test to verify Vitest + React Testing Library setup
it('increments the counter when the button is clicked', () => {
  render(<App/>)
  const button = screen.getByRole('button', {name: /count is/i})

  // Initial state
  expect(button).toHaveTextContent(/count is 0/i)

  // Click increments
  fireEvent.click(button)
  expect(button).toHaveTextContent(/count is 1/i)
})
