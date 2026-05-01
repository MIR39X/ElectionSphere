import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { OverviewCards } from './OverviewCards'
import { election, renderWithRouter, stateLabels, totals } from '../test/fixtures'

describe('OverviewCards', () => {
  it('renders election overview and capability chips', () => {
    renderWithRouter(<OverviewCards election={election} totals={totals} stateLabels={stateLabels} />)

    expect(screen.getByText('University Election')).toBeInTheDocument()
    expect(screen.getByText('Blockchain secured campus election')).toBeInTheDocument()
    expect(screen.getByText('Voting Open')).toBeInTheDocument()
    expect(screen.getByText(/role-based access/i)).toBeInTheDocument()
  })
})
