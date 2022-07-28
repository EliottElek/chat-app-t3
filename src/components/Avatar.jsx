import Image from "next/image";
export default function Avarar({ src, size }) {
  if (size === "small")
    return (
      <span
        className={`flex object-cover items-center justify-center h-[16px] w-[16px] rounded-full overflow-hidden bg-gray-100`}
      >
        {src ? (
          <Image
            src={src}
            height={16}
            width={16}
            className={"rounded-full object-cover"}
          />
        ) : (
          <svg
            className="h-full w-full text-gray-300"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </span>
    );
  else if (size === "semi-small")
    return (
      <span
        className={`flex object-cover items-center justify-center h-[26px] w-[26px] rounded-full overflow-hidden bg-gray-100`}
      >
        {src ? (
          <Image
            src={src}
            height={26}
            width={26}
            className={"rounded-full object-cover"}
          />
        ) : (
          <svg
            className="h-full w-full text-gray-300"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </span>
    );
  else if (size === "large")
    return (
      <span
        className={`flex object-cover items-center justify-center h-[120px] w-[120px] rounded-full overflow-hidden bg-gray-100`}
      >
        {src ? (
          <Image
            src={src}
            height={120}
            width={120}
            className={"rounded-full object-cover"}
          />
        ) : (
          <svg
            className="h-full w-full text-gray-300"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </span>
    );
  return (
    <span
      className={`flex object-cover items-center justify-center h-[40px] w-[40px] rounded-full overflow-hidden bg-gray-100`}
    >
      {src ? (
        <Image
          src={src}
          height={40}
          width={40}
          className={"rounded-full object-cover"}
        />
      ) : (
        <svg
          className="h-full w-full text-gray-300"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </span>
  );
}
