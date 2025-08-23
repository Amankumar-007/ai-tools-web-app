import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href="/" style={{ display: 'inline-block', margin: '17px 0 0 24px' }}>
      <Image
        src="/logo.png"
        alt="Logo"
        width={39}
        height={39}
        style={{
          objectFit: 'contain',
          cursor: 'pointer',
          display: 'block',
          borderRadius: '50%',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          background: '#fff',
        }}
        priority
      />
    </Link>
  );
}