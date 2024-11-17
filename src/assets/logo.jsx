import React from "react";

export default function Logo({ className, color = "#26CE83" ,onMouseEnter, onMouseLeave}) {
  return (
    <svg
      width="451"
      height="246"
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      viewBox="0 0 451 246"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_1_12)">
        <path
          d="M92 120.8V185.3C92 193.7 89.4 200.5 84.2 205.7C79 210.7 72.2 213.2 63.8 213.2H42.2C33.8 213.2 27 210.7 21.8 205.7C16.6 200.5 14 193.7 14 185.3V28.7C14 20.3 16.6 13.6 21.8 8.59999C27 3.39999 33.8 0.799983 42.2 0.799983H63.8C72.2 0.799983 79 3.39999 84.2 8.59999C89.4 13.6 92 20.3 92 28.7V95.9L63.5 92.9V30.2C63.5 29.2 63 28.7 62 28.7H44C43 28.7 42.5 29.2 42.5 30.2V183.8C42.5 184.8 43 185.3 44 185.3H62C63 185.3 63.5 184.8 63.5 183.8V120.8H92ZM134.241 212C125.041 212 117.641 209.4 112.041 204.2C106.641 198.8 103.941 192.1 103.941 184.1V89.9C103.941 81.7 106.641 75 112.041 69.8C117.641 64.6 125.041 62 134.241 62H135.441C140.841 62 145.641 63.3 149.841 65.9V62H178.341V184.1H182.541L185.541 212H149.841V200.3L142.341 212H134.241ZM133.941 89.9C132.941 89.9 132.441 90.4 132.441 91.4V182.6C132.441 183.6 132.941 184.1 133.941 184.1H149.841V89.9H133.941ZM227.169 62V75.2L235.269 62H255.369V91.1H227.169V212H198.669V89.9H191.469L194.469 62H227.169ZM264.488 212V184.1H302.588C303.588 184.1 304.088 183.6 304.088 182.6V123.5C304.088 122.5 303.588 122 302.588 122H264.488V32H332.588V59.9H292.988V94.1H304.388C312.788 94.1 319.588 96.7 324.788 101.9C329.988 106.9 332.588 113.6 332.588 122V184.1C332.588 192.5 329.988 199.3 324.788 204.5C319.588 209.5 312.788 212 304.388 212H264.488ZM344.469 212L372.669 107L344.469 1.99999H374.469L390.369 74.9L406.569 1.99999H436.569L408.069 107L436.569 212H406.569L390.369 139.1L374.469 212H344.469Z"
          fill={color}
        />
      </g>
      <defs>
        <filter
          id="filter0_d_1_12"
          x="0.1"
          y="0.79998"
          width="450.369"
          height="244.3"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="18" />
          <feGaussianBlur stdDeviation="6.95" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_1_12"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_1_12"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}
