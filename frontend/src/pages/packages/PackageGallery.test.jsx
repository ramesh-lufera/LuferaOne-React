/* global test, expect, afterEach */
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PackageGallery from './PackageGallery';

afterEach(cleanup);

test('four thumbnails switch the cover and the popup slides through all images', async () => {
  render(<PackageGallery name="Starter" cover="/cover.jpg" gallery={['/one.jpg', '/two.jpg', '/three.jpg']} />);
  expect(screen.getAllByRole('button', { name: /Show preview image/ })).toHaveLength(4);
  expect(screen.getByAltText('Starter — image 1')).toHaveAttribute('src', '/cover.jpg');
  expect(screen.getByRole('button', { name: 'Show preview image 1' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: 'Show preview image 1' }).querySelector('img')).toHaveAttribute('src', '/cover.jpg');
  fireEvent.click(screen.getByRole('button', { name: 'Show preview image 3' }));
  expect(screen.getByAltText('Starter — image 3')).toHaveAttribute('src', '/two.jpg');
  expect(screen.getByRole('button', { name: 'Show preview image 3' })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Enlarge Starter image' }));
  expect(await screen.findByRole('dialog', { name: 'Starter' })).toBeInTheDocument();
  expect(screen.getByAltText('Starter — enlarged image 3')).toHaveAttribute('src', '/two.jpg');
  fireEvent.click(screen.getByRole('button', { name: 'Next image' }));
  expect(screen.getByAltText('Starter — enlarged image 4')).toHaveAttribute('src', '/three.jpg');
  fireEvent.keyDown(window, { key: 'ArrowRight' });
  expect(screen.getByAltText('Starter — enlarged image 1')).toHaveAttribute('src', '/cover.jpg');
  fireEvent.keyDown(window, { key: 'ArrowLeft' });
  expect(screen.getByAltText('Starter — enlarged image 4')).toHaveAttribute('src', '/three.jpg');
  fireEvent.click(screen.getByRole('button', { name: 'Previous image' }));
  expect(screen.getByAltText('Starter — enlarged image 3')).toHaveAttribute('src', '/two.jpg');
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

test('existing packages without a gallery can still enlarge their cover image', async () => {
  render(<PackageGallery name="Legacy" cover="/cover.jpg" />);
  expect(screen.queryByRole('button', { name: /Show preview image/ })).not.toBeInTheDocument();
  expect(screen.getByAltText('Legacy — image 1').closest('.package-gallery')).toHaveClass('package-gallery-single');
  fireEvent.click(screen.getByRole('button', { name: 'Enlarge Legacy image' }));
  expect(await screen.findByRole('dialog')).toBeInTheDocument();
  expect(screen.getByAltText('Legacy — enlarged image 1')).toHaveAttribute('src', '/cover.jpg');
  expect(screen.queryByRole('button', { name: 'Next image' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /View gallery image/ })).not.toBeInTheDocument();
});
