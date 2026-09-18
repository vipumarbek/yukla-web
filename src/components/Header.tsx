/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { TRANSLATIONS } from "../translations";
import { LanguageCode, User } from "../types";
import { Globe, LogOut, Layout, User as UserIcon, Menu, X, Sparkles, TrendingUp, ShieldCheck, Settings } from "lucide-react";
import { useTranslation } from "../context/LanguageContext";

import Navbar, { NavbarProps } from "./Navbar";

export type HeaderProps = NavbarProps;
export default Navbar;
export { Navbar as Header };

