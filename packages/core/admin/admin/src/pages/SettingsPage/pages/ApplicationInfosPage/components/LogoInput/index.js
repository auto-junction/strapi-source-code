import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import PropType from 'prop-types';
import { CarouselInput, CarouselSlide, CarouselActions } from '@strapi/design-system/CarouselInput';
import { IconButton } from '@strapi/design-system/IconButton';
import { Box } from '@strapi/design-system/Box';
import Plus from '@strapi/icons/Plus';
import LogoModalStepper from '../LogoModalStepper';
import { SIZE, DIMENSION } from '../../utils/constants';

const LogoInput = ({ customLogo, defaultLogo }) => {
  const { formatMessage } = useIntl();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <CarouselInput
        label={formatMessage({
          id: 'Settings.application.customization.carousel.title',
          defaultMessage: 'Logo',
        })}
        selectedSlide={0}
        hint={formatMessage(
          {
            id: 'Settings.application.customization.carousel-hint',
            defaultMessage:
              'Change the admin panel logo (Max dimension: {dimension}*{dimension}, Max file size: {size}KB)',
          },
          { size: SIZE, dimension: DIMENSION }
        )}
        previousLabel="Previous slide"
        nextLabel="Next slide"
        onNext={() => {}}
        onPrevious={() => {}}
        secondaryLabel={customLogo?.name || 'logo.png'}
        actions={
          <CarouselActions>
            <IconButton
              onClick={() => setIsModalOpen(true)}
              label={formatMessage({
                id: 'Settings.application.customization.carousel.change-action',
                defaultMessage: 'Change logo',
              })}
              icon={<Plus />}
            />
          </CarouselActions>
        }
      >
        <CarouselSlide
          label={formatMessage({
            id: 'Settings.application.customization.carousel-slide.label',
            defaultMessage: 'Logo slide',
          })}
        >
          <Box
            maxHeight="40%"
            maxWidth="40%"
            as="img"
            src={customLogo?.url || defaultLogo}
            alt={formatMessage({
              id: 'Settings.application.customization.carousel.title',
              defaultMessage: 'Logo',
            })}
          />
        </CarouselSlide>
      </CarouselInput>
      <LogoModalStepper
        onClose={() => setIsModalOpen(false)}
        initialStep={customLogo ? 'pending' : 'upload'}
        isOpen={isModalOpen}
      />
    </>
  );
};

LogoInput.defaultProps = {
  customLogo: null,
};

LogoInput.propTypes = {
  customLogo: PropType.shape({
    url: PropType.string,
    name: PropType.string,
  }),
  defaultLogo: PropType.string.isRequired,
};

export default LogoInput;