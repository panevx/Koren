import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'
import { Home } from '../src/screens/Home'

vi.mock('../src/content/hubMissions', () => {
  throw new Error('The cached page could not load the new mission index')
})
afterEach(cleanup)

it('offers a reload when the mission index fails, with the navigation still accessible', async () => {
  render(<MemoryRouter><Home /></MemoryRouter>)
  expect(await screen.findByRole('button', { name: 'Презареди страницата' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Карта' })).toHaveAttribute('href', '/map')
})
