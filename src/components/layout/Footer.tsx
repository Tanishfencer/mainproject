import { Github, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white shadow-md mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2">
              <a href="tel:+919876543210" className="flex items-center text-gray-600 hover:text-blue-600">
                <Phone className="h-4 w-4 mr-2" />
                +91 98765 43210
              </a>
              <a href="mailto:support@ncet.edu.in" className="flex items-center text-gray-600 hover:text-blue-600">
                <Mail className="h-4 w-4 mr-2" />
                support@ncet.edu.in
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600">About Us</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600">Terms & Conditions</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600">Privacy Policy</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-blue-600">
                <Github className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} NCET Smart Parking. All rights reserved.
        </div>
      </div>
    </footer>
  );
}