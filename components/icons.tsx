
import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
    color?: string;
    width?: number;
    height?: number;
    style?: any;
}

export const BookOpenIcon: React.FC<IconProps> = ({ color = "#000", width = 24, height = 24, ...props }) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M12 6.25278C12 6.25278 5.75 3 3 3C3 3 3 17 12 21C21 17 21 3 21 3C18.25 3 12 6.25278 12 6.25278Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M12 6.25278V21" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

export const ScaleIcon: React.FC<IconProps> = ({ color = "#000", width = 24, height = 24, ...props }) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M9 3L3 9M9 3V9H3M9 3L12 6L15 3M15 3L21 9M15 3V9H21M12 6V21M12 6L9.5 8.5M12 21L3 12V16.5L12 21ZM12 21L21 12V16.5L12 21Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const InformationCircleIcon: React.FC<IconProps> = ({ color = "#000", width = 24, height = 24, ...props }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
    <Path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
    <Path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11.5V16.5"/>
    <Path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 7.5H12.01"/>
  </Svg>
);

export const CogIcon: React.FC<IconProps> = ({ color = "#000", width = 24, height = 24, ...props }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
    <Path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
    <Path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
    <Path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.0708 4.9292L18.6708 5.3292M4.9292 19.0708L5.3292 18.6708M12 2V3M12 21V22M2 12H3M21 12H22M19.0708 19.0708L18.6708 18.6708M4.9292 4.9292L5.3292 5.3292" />
  </Svg>
);

export const PlusIcon: React.FC<IconProps> = ({ color = "#000", width = 24, height = 24, ...props }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m-6-6h12" />
  </Svg>
);

export const EditIcon: React.FC<IconProps> = ({ color = "#000", width = 20, height = 20, ...props }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.0205 5.02072L18.9998 11M3.5 20.5L12.0205 5.02072C12.6318 4.14421 13.8436 4.0653 14.5623 4.85195L19.148 9.85195C19.8668 10.6386 19.9408 11.9358 19.243 12.8256L10.5 20.5H3.5V20.5Z" />
  </Svg>
);

export const TrashIcon: React.FC<IconProps> = ({ color = "#000", width = 20, height = 20, ...props }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 6H21M5 6V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V6M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" />
  </Svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ color = "#000", width = 20, height = 20, ...props }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m19 9-7 7-7-7" />
  </Svg>
);

export const MicrophoneIcon: React.FC<IconProps> = ({ color = "#000", width = 24, height = 24, ...props }) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M12 18.5V21M12 18.5C14.4853 18.5 16.5 16.4853 16.5 14V7C16.5 4.51472 14.4853 2.5 12 2.5C9.51472 2.5 7.5 4.51472 7.5 7V14C7.5 16.4853 9.51472 18.5 12 18.5ZM12 18.5C10 18.5 8.5 17 8.5 15M15.5 15C15.5 17 14 18.5 12 18.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const PlayIcon: React.FC<IconProps> = ({ color = "#000", width = 24, height = 24, ...props }) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M5.25 5.25v13.5l13.5-6.75L5.25 5.25Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const StopIcon: React.FC<IconProps> = ({ color = "#000", width = 24, height = 24, ...props }) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M5.25 5.25h13.5v13.5H5.25V5.25Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

// Add this new icon component to your components/icons.tsx file

export const CloseIcon: React.FC<{
  color?: string;
  width?: number;
  height?: number;
  style?: any;
}> = ({ color = 'currentColor', width = 24, height = 24, style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke={color}
    style={{ width, height, ...style }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
