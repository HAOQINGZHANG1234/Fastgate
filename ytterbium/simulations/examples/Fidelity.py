import numpy as np
import matplotlib.pyplot as plt

import ytterbium as yb
from ytterbium.Yb171.raman import FourLevelSystem
from qutip import *

delta_0=6
t_0=1 #ns
s=3*10**9

t=np.linspace(0, 15, num=100) #ns

# initialize the  transition in 171Yb+ as a four-level system
FLS = FourLevelSystem(sat_x=s ,sat_y=s*(12.6+90)/(90-12.6) ,detuning=120 ,B=1 ,packet=1)

# to measure the lineshape, we drive the system at different laser detunings,wave packet
# which are defined in MHz across ytterbium
laser_detuning = delta_0*np.cos(np.pi*t/t_0)
laser_packet=abs(np.sin(np.pi*t/t_0))

# for each detuning, we generate a Hamiltonian
hamiltonians, _ = yb.vary(FLS, delta=laser_detuning )

# initially, all population is in the ground state
psi0 = FLS.basis[0]

# we prepare population operators |i><i| for all states
population = FLS.basis[1] * FLS.basis[1].dag() 

# to use Python's multiprocessing module for parallel evaluation,
# the call to yb.mesolve() must not be executed unless the script
# is invoked directly

   
results = mesolve(hamiltonians, psi0, np.linspace(0, 10.0**(-6), num=41), FLS.decay, population)
result=results[25]
print(result.expect[0][-1])