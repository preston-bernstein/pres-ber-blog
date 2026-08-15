# Intake — proxmox-for-the-xps-17-offload-box

Date: 2026-08-15. Answered in chat by Preston, verbatim, unedited. Questions per `../post-intake.md`.

1. Take me to the moment.
> Yeah, the XPS 17 was just sitting there for a year or two, i tried giving it to my friend but he didn't want it, i wanted to sell it online but it was a whole pain and i kept getting lowballed. I just was having issues with my desktop having in / out ethernet issues with all the data transfers, so i was like why not?

2. Why did you care?
> yeah, the desktop was overloaded, and it was just getting annoying. I have a server rack undr my desk that had some space so it seemed like a neat solution

3. What surprised you or pissed you off?
> Nothing really bothered me, i had a spare usb c to ehternet dongle i could use. The power plug is finicky abnd i have to jiggle it just right and have it sit just right to be recognized.

4. What do you believe now that you didn't before?
> I believe i made the right choice, I feel good about the reuse of this laptopl. I wouldn't purchase a laptop to do this, but I'm happy I found an economical use.

5. Over-a-beer version.
> I had a spare laptop just sitting there, and this just allows me to offload some of that compute on my main desktop to this laptop and just be more efficient.

6. What's still bugging you?
> Oh nothing is ever perfect

7. What should the reader skip past?
> (not answered)

Other sourced facts used in the draft (not from the intake): the 2026-08-04 decision record and 2026-08-05/08 setup notes — Proxmox VE 9.2 on Debian 13, one LXC per workload; Fedora ruled out on Podman + ~13-month lifecycle; no built-in Ethernet, installed over wifi, USB-C dongle took over `nic0`/`vmbr0` with no config change; lid-switch fix tested by closing the lid with SSH open; bare Proxmox lacks `sudo`; deb822 `.sources` enterprise-repo 401 fix; arr-stack + fashion-monitor live on the box; nba-infra duplicated desktop + xps.
