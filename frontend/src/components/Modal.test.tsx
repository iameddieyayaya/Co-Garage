import { render, screen } from '@testing-library/react'
import Modal from './Modal'

describe('Modal', () => {
  it('renders title and content when open', () => {
    render(
      <Modal isOpen onClose={() => {}} title="Test title">
        <div>Content</div>
      </Modal>
    )

    expect(screen.getByText('Test title')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('disables action button when actionDisabled is true', () => {
    const onAction = jest.fn()
    render(
      <Modal isOpen onClose={() => {}} title="Test" actionText="Submit" onAction={onAction} actionDisabled>
        <div>Content</div>
      </Modal>
    )

    const button = screen.getByRole('button', { name: 'Submit' })
    expect(button).toBeDisabled()
  })
})
