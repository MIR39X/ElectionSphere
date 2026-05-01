import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { StatusBanner } from './StatusBanner'
import { renderWithRouter } from '../test/fixtures'

describe('StatusBanner', () => {
  it('renders nothing when there are no messages', () => {
    const { container } = renderWithRouter(<StatusBanner notice="" error="" explorerUrl="" />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders errors, explorer links, and toggled notices', async () => {
    const user = userEvent.setup()
    renderWithRouter(
      <StatusBanner notice="Transaction submitted" error="Wallet failed" explorerUrl="https://example.test/address/1" />
    )

    expect(screen.getByText('Wallet failed')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view deployed contract/i })).toHaveAttribute(
      'href',
      'https://example.test/address/1'
    )

    await user.click(screen.getByRole('button', { name: /toggle notification/i }))

    expect(screen.getByText('Transaction submitted')).toBeInTheDocument()
  })
})
