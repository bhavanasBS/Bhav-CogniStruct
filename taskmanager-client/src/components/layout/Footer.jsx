const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center">
      <p className="text-xs text-slate-400">
        &copy; {new Date().getFullYear()} CogniStruct Task Manager. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
