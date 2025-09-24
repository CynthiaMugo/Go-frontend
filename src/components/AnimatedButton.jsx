import { motion } from "framer-motion";

function AnimatedButton({ children, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1, backgroundColor: "#fbbf24" }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg shadow-lg transition-colors"
    >
      {children}
    </motion.button>
  );
}

export default AnimatedButton;
