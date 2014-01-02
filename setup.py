import os
from setuptools import setup, find_packages


def read(fname):
    return open(os.path.join(os.path.dirname(__file__), fname)).read()

setup(
    name="bitbingo",
    version="0.0.1",
    author="Jorge Niedbalski R.",
    author_email="niedbalski@gmail.com",
    description="A bitcoin based roulette game",
    packages=find_packages(),
    test_suite = 'nose.collector',
    long_description=read('README'),
    classifiers=[
        "Development Status :: 3 - Alpha",
    ],
    entry_points = """
    [console_scripts]
    init-db=bitbingo.common.db:initial
    """
)
