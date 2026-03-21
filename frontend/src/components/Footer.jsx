import React from 'react';
import { Globe, AtSign } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="container py-40 px-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-20">
        <div className="col-span-1">
          <h4 className="text-3xl font-bold mb-10 tracking-tighter">Guardian</h4>
          <div className="text-[12px] font-medium text-text-secondary uppercase tracking-[2px] opacity-50 leading-loose">
            © 2024 Guardian Safety. <br /> Developed with Precision. <br /> San Francisco, CA.
          </div>
        </div>
        
        {['Product', 'Company'].map(group => (
          <div key={group}>
            <span className="text-[12px] font-bold text-text mb-10 block uppercase tracking-[2.5px]">{group}</span>
            <ul className="space-y-6 text-[16px] font-medium text-text-secondary">
              {group === 'Product' 
                ? ['Technology', 'Network', 'Premium'].map(i => <li key={i}><a href="#" className="hover:text-text transition-colors">{i}</a></li>)
                : ['Our Story', 'Privacy', 'Contact'].map(i => <li key={i}><a href="#" className="hover:text-text transition-colors">{i}</a></li>)
              }
            </ul>
          </div>
        ))}

        <div className="flex gap-10 items-start pt-2">
           <div className="p-3 rounded-full hover:bg-black/5 cursor-pointer transition-colors border border-black/5">
              <Globe size={24} className="text-text-secondary hover:text-text" />
           </div>
           <div className="p-3 rounded-full hover:bg-black/5 cursor-pointer transition-colors border border-black/5">
              <AtSign size={24} className="text-text-secondary hover:text-text" />
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
