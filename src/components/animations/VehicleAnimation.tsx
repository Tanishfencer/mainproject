import { motion } from 'framer-motion';
import { Car } from 'lucide-react';

export function VehicleAnimation() {
  return (
    <motion.div
      className="fixed bottom-0 left-0"
      initial={{ x: '-100%' }}
      animate={{
        x: '120%',
        transition: {
          duration: 2,
          ease: 'easeInOut',
        },
      }}
      exit={{ x: '120%' }}
    >
      <Car className="w-16 h-16 text-primary" />
    </motion.div>
  );
}
