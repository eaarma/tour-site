const MarginContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
      {children}
    </div>
  );
};
export default MarginContainer;
