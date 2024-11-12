interface AlertProps {
    message: string;
    type: 'success' | 'error';
  }
  
  const Alert: React.FC<AlertProps> = ({ message, type }) => (
    <div className={`alert ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white p-4 rounded mb-4`}>
      {message}
    </div>
  );
  
  export default Alert;
  