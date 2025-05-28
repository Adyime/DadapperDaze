import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-drb-dark text-white border-t-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="font-heading text-xl font-extrabold text-drb-pink mb-4">DaDapperDaze</h3>
            <p className="text-drb-gray font-sans text-sm">
              A modern eCommerce platform for the fashion-forward.
            </p>
          </div>

          <div>
            <h3 className="font-heading text-lg font-semibold text-white mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-drb-gray hover:text-drb-pink font-sans transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-drb-gray hover:text-drb-pink font-sans transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-drb-gray hover:text-drb-pink font-sans transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-lg font-semibold text-white mb-4">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-drb-gray hover:text-drb-pink font-sans transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-drb-gray hover:text-drb-pink font-sans transition-colors">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-drb-gray hover:text-drb-pink font-sans transition-colors">
                  Orders
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-drb-gray hover:text-drb-pink font-sans transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-lg font-semibold text-white mb-4">Connect</h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-drb-gray hover:text-drb-pink transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-drb-gray hover:text-drb-pink transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-drb-gray hover:text-drb-pink transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
            <p className="mt-4 text-xs text-drb-gray font-sans">
              Subscribe to our newsletter for updates on new products and promotions.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-drb-gray/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-drb-gray font-sans">
              &copy; {new Date().getFullYear()} DaDapperDaze. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-xs text-drb-gray hover:text-drb-pink font-sans transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs text-drb-gray hover:text-drb-pink font-sans transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
