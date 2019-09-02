__all__ = ["FourLevelSystemnew"]

import itertools

import numpy as np
import qutip

# Clebsch-Gordan coefficients
cg = np.zeros((4, 4))

# sigma- transitions
cg[0][2] = cg[2][0] = -1 / np.sqrt(3)
cg[1][2] = cg[2][1] = -1 / np.sqrt(3)
# sigma+ transitions
cg[0][3] = cg[3][0] = -1 / np.sqrt(3)
cg[1][3] = cg[3][1] = 1 / np.sqrt(3)

# mF factors
mF = np.zeros(4)
mF[0] = mF[1] = 0
mF[2] = -1
mF[3] = 1


class FourLevelSystem1:
    linewidth = 19.7 * 10 ** 6  # Hz

    def __init__(self, sat_x=0.0, sat_y=0.0, delta=0.0, detuning=0.0, B=0.0):
        """Model of the 2S1/2-2S1/2 transition in 171Yb+ as a four-level system
        to simulate Raman transitions from (S, F=0, mF=0) to (S, F=1, mF=0) via
        (P, F=1, mF=1) and (P, F=1, mF=-1).

        :param sat_x: Intensity of the x-polarized laser in multiples of its
                       on-resonance, two-level saturation intensity.
        :param sat_y: Intensity of the y-polarized laser in multiples of its
                        on-resonance, two-level saturation intensity.
        :param delta: Frequency difference between the two lasers:   delta0-delta1
        :param detuning: Detuning from the excited state in GHz:  delta1
        :param B: Magnetic field in Gauss.
        """
        super(FourLevelSystem, self).__init__()
        self.sat_x = sat_x
        self.sat_y = sat_y
        self.delta = delta
        self.detuning = detuning
        self.B = B

        self.basis = [qutip.states.basis(4, i) for i in range(4)]

    @property
    def H(self):
        """Full Hamiltonian of the system."""
        laser_field = [2 * np.pi * self.detuning * 10 ** 9 * self.basis[i] * self.basis[i].dag()
                       for i in (0, 2)]
        laser_field.append(2 * np.pi * self.delta * 10 ** 6 * self.basis[0] * self.basis[0].dag())

        magnetic_field = [2 * np.pi * mF[i] * 1.4 * 10 ** 6 * self.B * self.basis[i] * self.basis[i].dag()
                          for i in range(4)]

        off_diagonal_elements = [self.omega[i][j] / 2 * self.basis[i] * self.basis[j].dag() * cg[i][j] ** 2
                                 for i, j in itertools.product(range(4), range(4))]

        return sum(laser_field) + sum(magnetic_field) + sum(off_diagonal_elements)

    @property
    def decay(self):
        """Decay terms prepared for use in `qutip.mesolve`."""
        return list(itertools.chain(*self.raw_decay))

    @property
    def raw_decay(self):
        """All decay terms."""
        decay = [[] for _ in range(4)]
        decay[2] = [np.sqrt(2 * np.pi * self.linewidth) * cg[i][2]
                    * self.basis[i] * self.basis[2].dag()
                    for i in range(2)]
        decay[3] = [np.sqrt(2 * np.pi * self.linewidth) * cg[i][3]
                    * self.basis[i] * self.basis[3].dag()
                    for i in range(2)]
        return decay

    @property
    def omega(self):
        _omega_x = 2 * np.pi * self.linewidth * np.sqrt(self.sat_x / 2)
        _omega_y = 2 * np.pi * self.linewidth * np.sqrt(self.sat_y / 2)

        omega = np.zeros((4, 4))
        omega[0][2] = omega[2][0] = _omega_x/np.sqrt(2)
        omega[1][2] = omega[2][1] = _omega_y/np.sqrt(2)
        omega[0][3] = omega[3][0] = _omega_x/np.sqrt(2)
        omega[1][3] = omega[3][1] = -_omega_y/np.sqrt(2)
        return omega

# Clebsch-Gordan coefficients
cg = np.zeros((4, 4))
cg[0][3] = cg[3][0] = 1 / np.sqrt(3)
cg[1][3] = cg[3][1] = cg[2][3] = cg[3][2] = -1 / np.sqrt(3)

# mF factors
mF = np.zeros(4)
mF[0] = mF[3] = 0
mF[1] = -1
mF[2] = 1


c