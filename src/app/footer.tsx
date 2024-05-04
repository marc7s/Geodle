import Link from 'next/link';

export default function Footer() {
  return (
    <footer className='flex flex-col justify-center items-center w-full h-[4rem] mt-[2rem] absolute bg-gradient-to-t from-background to-transparent brightness-50'>
      <Link href='https://github.com/marc7s/Geodle' className='mb-1'>
        marc7s
      </Link>
      <div className='text-xs'>
        Build {process.env.APP_HASH} @ {process.env.APP_DATE}
      </div>
    </footer>
  );
}
