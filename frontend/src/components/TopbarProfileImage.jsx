import { useEffect, useState } from 'react';
import { useAccessUser } from '../helper/AccessContext';
import { api } from '../services/api';
import AuthBrandingImage from './AuthBrandingImage';

export default function TopbarProfileImage() {
  const user = useAccessUser();
  const userId = user?.id;
  const updatedProfileImage = user?.profile_image_url;
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    if (!userId || updatedProfileImage !== undefined) return;

    const controller = new AbortController();
    api('/profile', { signal: controller.signal })
      .then(({ user: profile }) => {
        if (!controller.signal.aborted && profile?.id === userId) {
          setProfilePhoto({ userId, url: profile.profile_image_url });
        }
      })
      .catch(() => {
        // The provider photo or default avatar is still available.
      });

    return () => controller.abort();
  }, [userId, updatedProfileImage]);

  const uploadedPhoto = updatedProfileImage !== undefined
    ? updatedProfileImage
    : profilePhoto?.userId === userId ? profilePhoto?.url : null;

  return (
    <AuthBrandingImage
      key={userId}
      src={uploadedPhoto || user?.google_photo_url || user?.facebook_photo_url}
      fallbackSrc='/assets/images/user.png'
      alt='Profile'
      width={40}
      height={40}
      referrerPolicy='no-referrer'
      className='w-40-px h-40-px object-fit-cover rounded-circle'
    />
  );
}
