# Parth Pusadkar — Portfolio

A personal portfolio website introducing my education, skills, projects, internship experience, patent publication, certificates, and contact links.

## Built with

- HTML5
- CSS3
- JavaScript

The portfolio is a static webpage. A small Supabase project provides the secure admin login and visitor-event database for the optional private dashboard at `/#admin`.

## View it locally

1. Download or clone this repository.
2. Open `index.html` in a web browser.

An internet connection is needed for Google Fonts, project photos loaded from Unsplash, and Supabase visitor tracking. The rest of the page and its local documents are included in this repository.

## Private visitor dashboard setup

The portfolio does not use Google Analytics. To activate its admin-only visitor dashboard:

1. Create a Supabase project.
2. In the Supabase SQL Editor, run the contents of `supabase-setup.sql`.
3. In Authentication → Users, create a confirmed user for `parthpusadkar1312@gmail.com` and set its password. Do not put the password in this repository.
4. In `analytics-config.js`, set `supabaseUrl` to the project's URL and `supabaseAnonKey` to its public anon/publishable key. Never use a `service_role` or secret key in browser code.
5. Publish the site. Open `/#admin` and sign in with the Supabase admin user to see visit totals and live activity.

The database permits anonymous visitors to add only limited visit metadata. Read access is restricted by row-level security to the administrator email above. The tracker records page path, timestamp, referrer host, device category, browser, and OS; it does not store IP addresses or exact device names. The dashboard is accessible from the portfolio footer and is protected by login and database policies.

## Portfolio sections

- About me and education
- Skills and academic results
- Projects
- Business Analytics internship at Maincrafts Technology
- Published patent application
- Certificates and résumé
- Contact, LinkedIn, and GitHub links

## Supporting files

- Profile photo: `assets/profile/`
- Certificates: `assets/certificates/`
- Patent publication pages: `assets/patent/`
- Résumé: `assets/resume/`

## Contact

- LinkedIn: [linkedin.com/in/parthpusadkar](https://www.linkedin.com/in/parthpusadkar/)
- GitHub: [github.com/gotr0oted](https://github.com/gotr0oted)

