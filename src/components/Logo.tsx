import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '17px 0 0 24px' }}>
      <Link href="/" style={{ display: 'inline-block' }} aria-label="Go to homepage">
        <motion.div
          whileHover={{ scale: 1.07, rotate: 5 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 320, damping: 18 }}
          style={{
            display: 'inline-block',
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            willChange: 'transform',
          }}
        
        >
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
            }}
            priority
          />
        </motion.div>
      </Link>
    </div>
  );
}